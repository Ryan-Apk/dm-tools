import Button from './Button.jsx';
import InputField from './InputField.jsx';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Panel from "./Panel.jsx";
import {useNavigate} from "react-router-dom";

export default function LoginModal({ closeModal }) {
  // TODO in the future the API should be setup such that we can tell what error is happening
  const [hasEmailError, setHasEmailError] = useState(false);
  const [hasPasswordError, setHasPasswordError] = useState(false);
  const { login, isModalOpen } = useAuth();
  const navigate = useNavigate();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: ({ email, password }) => apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuthRetry: true,
    }),
    onSuccess: async () => {
      await login();
      setHasEmailError(false);
      setHasPasswordError(false);
      closeModal?.();
    },
    onError: (error) => {
      // TODO make this return something more normal
      console.error(error);
      setHasEmailError(true);
      setHasPasswordError(true);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get('email');
    const password = formData.get('password');

    mutate({ email, password });
  }

  return (
    <div className="flex-H-V-Center flex-col">
      {isModalOpen && (<h2 className="font-bold text-2xl text-accent">Session expired - please log in again.</h2>)}
      <Panel>
        <h1 className="font-bold text-4xl mb-5">Login</h1>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label htmlFor="email" className="flex flex-col text-xl mb-4">
            Email
            <InputField type="email" name="email" id="email" placeholder="Email" className="border rounded-md p-1 text-lg" />
            {isError && hasEmailError && (
              <p className="text-primary text-xs">Check email is correct and try again.</p>
            )}
          </label>

          <label htmlFor="password" className="flex flex-col text-xl">
            Password
            <InputField type="password" name="password" id="password" placeholder="Password" className="border rounded-md p-1 text-lg" />
            {isError && hasPasswordError && (
              <p className="text-primary text-xs">Check password is correct and try again.</p>
            )}
          </label>
          <p className="text-primary underline hover:text-secondary" onClick={() => navigate("/signup")}>New? Click to sign up.</p>

          <div className="text-center mt-5">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Sending...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
