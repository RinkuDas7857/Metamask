import { StyleUtilityProps } from '../../../component-library/box';
import { ButtonProps } from '../../../component-library/button';

export interface FooterProps
  extends Omit<StyleUtilityProps, 'className'> {
  /**
   * Additional className to assign the ConfirmFooter component
   */
  className?: string;
  /**
   * Additional props to pass to the cancel button accepts all props of the Button component
   */
  cancelButtonProps?: ButtonProps<'button'>;
  /**
   * Additional props to pass to the confirm button accepts all props of the Button component
   */
  confirmButtonProps?: ButtonProps<'button'>;
}
