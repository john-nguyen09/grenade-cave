import Button from './Button';
import Input from './Input';
import styles from './EditUserForm.module.css';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';
import { localKV } from '@/lib/liveStore';

const schema = yup
  .object({
    name: yup.string().required('Name is required'),
  });

function EditUserForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleSubmitEditUser = (data) => {
    localKV.set('user.name', data.name);
    onSubmit && onSubmit();
  };

  useEffect(() => {
    reset({
      name: localKV.get('user.name'),
    });
  }, [reset]);

  return (
    <form onSubmit={handleSubmit(handleSubmitEditUser)} className={styles.form}>
      <div className={styles.inputWrapper}>
        <Input type="text" {...register('name')} />
        {errors.name && (
          <div className={styles.error}>{errors.name.message}</div>
        )}
      </div>
      <div className={styles.buttonWrapper}>
        <Button>Edit</Button>
      </div>
    </form>
  );
}

export default EditUserForm;
