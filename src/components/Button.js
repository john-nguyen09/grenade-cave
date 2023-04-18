import classNames from 'classnames';
import styles from './Button.module.css';

function Button({ children, appendClassName, variant = 'primary', ...props }) {
  return (
    <button
      className={classNames(styles.button, styles[variant], appendClassName)}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
