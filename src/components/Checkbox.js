import { forwardRef } from 'react';
import styles from './Checkbox.module.css';
import classNames from 'classnames';

const Checkbox = forwardRef(function Checkbox(
  { label, appendClassName, ...props },
  ref
) {
  return (
    <label>
      <input
        className={classNames(styles.input, appendClassName)}
        {...props}
        ref={ref}
        type="checkbox"
      />
      {label}
    </label>
  );
});

export default Checkbox;
