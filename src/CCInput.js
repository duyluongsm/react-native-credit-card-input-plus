import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  TextInputPropTypes,
  ViewPropTypes,
} from "deprecated-react-native-prop-types";

const s = StyleSheet.create({
  baseInputStyle: {
    color: "black",
  },
});

export default class CCInput extends Component {
  static propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    keyboardType: PropTypes.string,

    status: PropTypes.oneOf(["valid", "invalid", "incomplete"]),

    containerStyle: ViewPropTypes.style,
    inputStyle: TextInputPropTypes.style,
    labelStyle: TextInputPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    onLayout: PropTypes.func,
    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    onBecomeEmpty: PropTypes.func,
    onBecomeValid: PropTypes.func,
    additionalInputProps: PropTypes.objectOf(PropTypes.shape(TextInputPropTypes)),
  };

  static defaultProps = {
    label: "",
    value: "",
    status: "incomplete",
    containerStyle: {},
    inputStyle: {},
    labelStyle: {},
    onLayout: () => {},
    onFocus: () => {},
    onChange: () => {},
    onBecomeEmpty: () => {},
    onBecomeValid: () => {},
    additionalInputProps: {},
  };

  componentDidUpdate(prevProps) {
    const { status, value, onBecomeEmpty, onBecomeValid, field } = this.props;

    if (value !== "" && prevProps.value === "") onBecomeEmpty(field);
    if (status !== "valid" && prevProps.status === "valid") onBecomeValid(field);
  }

  focus = () => this.inputRef.focus();

  _onFocus = () => this.props.onFocus(this.props.field);
  _onChange = (value) => this.props.onChange(this.props.field, value);

  render() {
    const {
      label,
      value,
      placeholder,
      status,
      keyboardType,
      containerStyle,
      inputStyle,
      labelStyle,
      validColor,
      invalidColor,
      placeholderColor,
      onLayout,
      additionalInputProps,
    } = this.props;

    return (
      <TouchableOpacity onPress={() => this.inputRef.focus()} activeOpacity={0.99}>
        <View onLayout={onLayout} style={[containerStyle]}>
          {!!label && <Text style={[labelStyle]}>{label}</Text>}
          <TextInput
            ref={(ref) => { this.inputRef = ref; }}
            {...additionalInputProps}
            keyboardType={keyboardType}
            autoCapitalize="words"
            autoCorrect={false}
            style={[
              s.baseInputStyle,
              inputStyle,
              validColor && status === "valid"
                ? { color: validColor }
                : invalidColor && status === "invalid"
                ? { color: invalidColor }
                : {},
            ]}
            underlineColorAndroid={"transparent"}
            placeholderTextColor={placeholderColor}
            placeholder={placeholder}
            value={value}
            onFocus={this._onFocus}
            onChangeText={this._onChange}
          />
        </View>
      </TouchableOpacity>
    );
  }
}
