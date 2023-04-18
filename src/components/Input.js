import { forwardRef } from 'react';
import styles from './Input.module.css';
import classNames from 'classnames';

const Input = forwardRef(function Input({ appendClassName, ...props }, ref) {
  return (
    <input
      className={classNames(styles.input, appendClassName)}
      {...props}
      ref={ref}
    />
  );
});

export default Input;
