import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from './Input';
import Button from './Button';
import styles from './MessageForm.module.css';
import { messageAdd } from '@/lib/liveStore';

const schema = yup.object({
  text: yup.string().required(),
});

function MessageForm() {
  const { register, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const handleSubmitMessage = ({ text }) => {
    if (!text) {
      return;
    }

    messageAdd(text);
    reset();
  };

  return (
    <form
      className={styles.controlBar}
      onSubmit={handleSubmit(handleSubmitMessage)}
    >
      <Input
        type="text"
        placeholder="Send a message"
        className={styles.chatInput}
        {...register('text')}
        autoComplete="off"
      />
      <Button className={styles.sendButton}>Send</Button>
    </form>
  );
}

export default MessageForm;
