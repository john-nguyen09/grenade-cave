import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(function Input(props, ref) {
  return <input className={styles.input} {...props} ref={ref} />;
});

export default Input;
