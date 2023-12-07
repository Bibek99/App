import React, {Component, useEffect, useRef} from 'react';
import {StyleProp, TextInputProps, ViewStyle} from 'react-native';
import {AnimatedProps} from 'react-native-reanimated';
import * as Browser from '@libs/Browser';
import DomUtils from '@libs/DomUtils';
import Visibility from '@libs/Visibility';
import useThemeStyles from '@styles/useThemeStyles';
import BaseTextInput from './BaseTextInput';
import type BaseTextInputProps from './BaseTextInput/types';
import type {BaseTextInputRef} from './BaseTextInput/types';
import * as styleConst from './styleConst';

type RemoveVisibilityListener = () => void;

function TextInput(
    {label = '', name = '', textInputContainerStyles, inputStyle, disableKeyboard = false, multiline = false, prefixCharacter, inputID, ...props}: BaseTextInputProps,
    ref: BaseTextInputRef,
) {
    const styles = useThemeStyles();
    const textInputRef = useRef<HTMLFormElement>(null);
    const removeVisibilityListenerRef = useRef<RemoveVisibilityListener>(null);

    useEffect(() => {
        let removeVisibilityListener = removeVisibilityListenerRef.current;
        if (disableKeyboard) {
            textInputRef.current?.setAttribute('inputmode', 'none');
        }

        if (name) {
            textInputRef.current?.setAttribute('name', name);
        }

        removeVisibilityListener = Visibility.onVisibilityChange(() => {
            if (!Browser.isMobileChrome() || !Visibility.isVisible() || !textInputRef.current || DomUtils.getActiveElement() !== textInputRef.current) {
                return;
            }
            textInputRef.current.blur();
            textInputRef.current.focus();
        });

        return () => {
            if (!removeVisibilityListener) {
                return;
            }
            removeVisibilityListener();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isLabeledMultiline = Boolean(label?.length) && multiline;
    const labelAnimationStyle = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--active-label-translate-y': `${styleConst.ACTIVE_LABEL_TRANSLATE_Y}px`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--active-label-scale': `${styleConst.ACTIVE_LABEL_SCALE}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--label-transition-duration': `${styleConst.LABEL_ANIMATION_DURATION}ms`,
    };

    return (
        <BaseTextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={(element) => {
                if (element) {
                    (textInputRef.current as HTMLElement | Component<AnimatedProps<TextInputProps>>) = element;
                }
                if (!ref) {
                    return;
                }

                if (typeof ref === 'function') {
                    ref(element);
                    return;
                }

                // eslint-disable-next-line no-param-reassign
                ref.current = element;
            }}
            inputStyle={[styles.baseTextInput, styles.textInputDesktop, isLabeledMultiline ? styles.textInputMultiline : {}, inputStyle]}
            textInputContainerStyles={[labelAnimationStyle as StyleProp<ViewStyle>, textInputContainerStyles]}
        />
    );
}

TextInput.displayName = 'TextInput';

export default React.forwardRef(TextInput);
