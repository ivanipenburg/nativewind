import { render } from "@testing-library/react-native";
import { FunctionComponent } from "react";
import { StyleProp, ViewProps, ViewStyle, StyleSheet } from "react-native";
import * as nativewind from "../../src/runtime/native/styled";
import { NativeWindStyleSheet, styled, StyledComponent } from "../../src";
import { create } from "../test-utils";

afterEach(() => {
  NativeWindStyleSheet.__reset();
  jest.clearAllMocks();
});

test("StyledComponent wrapping styled()", () => {
  /**
   * When using styled() & the babel plugin, it will convert the styled()
   * component into <StyledComponent component={styled(component) } />
   *
   * This test ensures that StyledComponent is only called once, and the
   * styled(component) doesn't call StyledComponent again
   *
   */
  create("p-4");

  const renderSpy = jest.spyOn(
    nativewind.StyledComponent as unknown as Record<string, () => void>,
    "render"
  );

  const Component = jest.fn((props) => props.children);

  render(
    <nativewind.StyledComponent component={styled(Component)} className="p-4" />
  );

  expect(Component).toHaveBeenCalledWith(
    expect.objectContaining({
      style: {
        padding: 14,
      },
    }),
    {}
  );

  expect(renderSpy).toHaveBeenCalledTimes(1);
});

test("default variant", () => {
  create("bg-white p-4");

  const Component = jest.fn(
    (props) => props.children
  ) as FunctionComponent<ViewProps>;

  const MyStyledComponent = styled(Component, "bg-white", {
    variants: {
      size: {
        large: "p-4",
      },
    },
    defaultProps: {
      size: "large",
    },
  });

  render(<MyStyledComponent />);

  expect(Component).toHaveBeenCalledWith(
    expect.objectContaining({
      style: {
        backgroundColor: "#fff",
        padding: 14,
      },
    }),
    {}
  );
});

test("boolean variants", () => {
  create("bg-white p-4");

  const Component = jest.fn(
    (props) => props.children
  ) as FunctionComponent<ViewProps>;

  const MyStyledComponent = styled(Component, {
    variants: {
      white: {
        true: "bg-white",
        black: "bg-white",
      },
      appearance: {
        false: "p-4",
      },
    },
  });

  render(<MyStyledComponent white />);

  expect(Component).toHaveBeenCalledWith(
    expect.objectContaining({
      style: {
        backgroundColor: "#fff",
        padding: 14,
      },
    }),
    {}
  );
});

test("with props & variant", () => {
  create("bg-white p-4 m-2");

  const OuterView = jest.fn((props) => props.children);
  const InnerView = jest.fn();

  interface ViewWithInnerProps extends ViewProps {
    innerStyle?: StyleProp<ViewStyle>;
  }

  function ViewWithInner({ innerStyle, ...props }: ViewWithInnerProps) {
    return (
      <OuterView {...props}>
        <InnerView style={innerStyle} />
      </OuterView>
    );
  }

  const StyledViewWithInner = styled(ViewWithInner, "bg-white", {
    props: {
      innerStyle: true,
    },
    variants: {
      size: {
        large: "p-4",
      },
    },
    defaultProps: {
      size: "large",
    },
  });

  render(<StyledViewWithInner innerStyle="m-2" />);

  expect(OuterView).toHaveBeenCalledWith(
    expect.objectContaining({
      style: {
        backgroundColor: "#fff",
        padding: 14,
      },
    }),
    {}
  );

  expect(InnerView).toHaveBeenCalledWith(
    expect.objectContaining({
      style: {
        margin: 7,
      },
    }),
    {}
  );
});

test("with Stylesheet.create", () => {
  create("m-2");

  const Component = jest.fn();
  const MyComponent = styled(Component);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: "center",
    },
  });

  render(
    <StyledComponent
      component={MyComponent}
      className="m-2"
      style={styles.container}
    />
  );

  expect(Component).toHaveBeenCalledWith(
    expect.objectContaining({
      style: [
        {
          margin: 7,
        },
        {
          flex: 1,
          padding: 24,
          justifyContent: "center",
        },
      ],
    }),
    {}
  );
});

test("prop alias", () => {
  create("m-2");

  const OuterView = jest.fn((props) => props.children);
  const InnerView = jest.fn();

  function ViewWithInner({
    innerStyle,
    ...props
  }: ViewProps & { innerStyle?: StyleProp<ViewStyle> }) {
    return (
      <OuterView {...props}>
        <InnerView style={innerStyle} />
      </OuterView>
    );
  }

  const StyledViewWithInner = styled(ViewWithInner, {
    props: {
      innerClassName: "innerStyle",
    },
  });

  render(<StyledViewWithInner innerClassName="m-2" />);

  expect(OuterView).toHaveBeenCalledWith(
    expect.objectContaining({
      style: undefined,
    }),
    {}
  );

  expect(InnerView).toHaveBeenCalledWith(
    expect.objectContaining({
      style: {
        margin: 7,
      },
    }),
    {}
  );
});