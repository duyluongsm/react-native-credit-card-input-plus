import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";

import {
  TextInputPropTypes,
  ViewPropTypes,
} from "deprecated-react-native-prop-types";

import CreditCard from "./CardView";
import CCInput from "./CCInput";
import { InjectedProps } from "./connectToState";

const s = StyleSheet.create({
  container: {},
  cardViewContainer: {
    alignItems: "center",
  },
  form: {
    marginTop: 20,
  },
  formContainer: {
    paddingHorizontal: 10,
  },
  inputContainer: {
    width: "100%",
  },
  inputLabel: {
    fontWeight: "bold",
  },
  input: {
    height: 40,
  },
});

const CVC_INPUT_WIDTH = 70;
const EXPIRY_INPUT_WIDTH = CVC_INPUT_WIDTH;
const CARD_NUMBER_INPUT_WIDTH_OFFSET = 40;
const CARD_NUMBER_INPUT_WIDTH =
  Dimensions.get("window").width -
  EXPIRY_INPUT_WIDTH -
  CARD_NUMBER_INPUT_WIDTH_OFFSET;
const NAME_INPUT_WIDTH = CARD_NUMBER_INPUT_WIDTH;
const PREVIOUS_FIELD_OFFSET = 40;
const POSTAL_CODE_INPUT_WIDTH = 120;

export default class CreditCardInput extends Component {
  constructor(props) {
    super(props);
    this.formRef = createRef();
    this.inputRefs = {
      number: createRef(),
      expiry: createRef(),
      cvc: createRef(),
      name: createRef(),
      postalCode: createRef(),
    };
    
    this.inputLayouts = {};
  }

  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,

    inputStyle: TextInputPropTypes.style,
    labelStyle: TextInputPropTypes.style,
    inputContainerStyle: ViewPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    cardImageFront: PropTypes.number,
    cardImageBack: PropTypes.number,
    cardScale: PropTypes.number,
    cardFontFamily: PropTypes.string,
    cardBrandIcons: PropTypes.object,

    allowScroll: PropTypes.bool,
    horizontalScroll: PropTypes.bool,

    additionalInputsProps: PropTypes.objectOf(PropTypes.shape(TextInputPropTypes)),
  };

  static defaultProps = {
    cardViewSize: {},
    labels: {
      name: "CARDHOLDER'S NAME",
      number: "CARD NUMBER",
      expiry: "EXPIRY",
      cvc: "CVC/CCV",
      postalCode: "POSTAL CODE",
    },
    placeholders: {
      name: "Full Name",
      number: "1234 5678 1234 5678",
      expiry: "MM/YY",
      cvc: "CVC",
      postalCode: "34567",
    },
    inputContainerStyle: {},
    validColor: "",
    invalidColor: "red",
    placeholderColor: "gray",
    allowScroll: false,
    horizontalScroll: true,
    additionalInputsProps: {},
  };

  componentDidMount() {
    this._focus(this.props.focused);
  }

  componentDidUpdate(prevProps) {
    if (this.props.focused !== prevProps.focused) {
      this._focus(this.props.focused);
    }
  }

  _onInputLayout = (field, event) => {
    const {nativeEvent: {layout}} = event;
    this.inputLayouts[field] = layout;
  }

  _focus = (field) => {
    if (!field) return;

    const scrollRef = this.formRef.current;
    const inputRef = this.inputRefs[field].current;

    if (scrollRef && inputRef) {
      // Focus the input
      inputRef.focus();

      // Scroll to the input if possible
      if (this.inputLayouts[field]) {
        const layout = this.inputLayouts[field];
        scrollRef.scrollTo({
          x: Math.max(layout.x - PREVIOUS_FIELD_OFFSET, 0),
          animated: true,
        });
      }
    }
  };

  _inputProps = (field) => {
    const {
      inputStyle,
      labelStyle,
      validColor,
      invalidColor,
      placeholderColor,
      placeholders,
      labels,
      values,
      status,
      onFocus,
      onChange,
      onBecomeEmpty,
      onBecomeValid,
      additionalInputsProps,
    } = this.props;

    return {
      ref: this.inputRefs[field],
      onLayout: (event) => this._onInputLayout(field, event),
      inputStyle: [s.input, inputStyle],
      labelStyle: [s.inputLabel, labelStyle],
      validColor,
      invalidColor,
      placeholderColor,
      field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus,
      onChange,
      onBecomeEmpty,
      onBecomeValid,

      additionalInputProps: additionalInputsProps[field],
    };
  };

  getStylesCCInput = ({ defaultWidth }) => {
    let _styles = [s.inputContainer];

    // If horizontal scroll is on
    if (this.props.horizontalScroll) {
      _styles.push({
        marginLeft: 10,
        width: defaultWidth,
      });
    }

    if (this.props.inputContainerStyle) {
      _styles.push(this.props.inputContainerStyle);
    }

    return _styles;
  };

  render() {
    const {
      cardImageFront,
      cardImageBack,
      values: { number, expiry, cvc, name, type },
      focused,
      allowScroll,
      horizontalScroll,
      requiresName,
      requiresCVC,
      requiresPostalCode,
      cardScale,
      cardFontFamily,
      cardBrandIcons,
    } = this.props;

    return (
      <View style={s.container}>
        <View style={s.cardViewContainer}>
          <CreditCard
            focused={focused}
            brand={type}
            scale={cardScale}
            fontFamily={cardFontFamily}
            imageFront={cardImageFront}
            imageBack={cardImageBack}
            customIcons={cardBrandIcons}
            name={requiresName ? name : " "}
            number={number}
            expiry={expiry}
            cvc={cvc}
          />
        </View>

        <ScrollView
          ref={this.formRef}
          horizontal={horizontalScroll}
          keyboardShouldPersistTaps="always"
          scrollEnabled={allowScroll}
          showsHorizontalScrollIndicator={false}
          style={s.form}
          contentContainerStyle={s.formContainer}
        >
          <CCInput
            {...this._inputProps("number")}
            keyboardType="numeric"
            containerStyle={this.getStylesCCInput({
              defaultWidth: CARD_NUMBER_INPUT_WIDTH,
            })}
          />
          <CCInput
            {...this._inputProps("expiry")}
            keyboardType="numeric"
            containerStyle={this.getStylesCCInput({
              defaultWidth: EXPIRY_INPUT_WIDTH,
            })}
          />
          {requiresCVC && (
            <CCInput
              {...this._inputProps("cvc")}
              keyboardType="numeric"
              containerStyle={this.getStylesCCInput({
                defaultWidth: CVC_INPUT_WIDTH,
              })}
            />
          )}
          {requiresName && (
            <CCInput
              {...this._inputProps("name")}
              containerStyle={this.getStylesCCInput({
                defaultWidth: NAME_INPUT_WIDTH,
              })}
            />
          )}
          {requiresPostalCode && (
            <CCInput
              {...this._inputProps("postalCode")}
              keyboardType="numeric"
              containerStyle={this.getStylesCCInput({
                defaultWidth: POSTAL_CODE_INPUT_WIDTH,
              })}
            />
          )}
        </ScrollView>
      </View>
    );
  }
}
