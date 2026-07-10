import Button from './Button.jsx';
import InputField from './InputField.jsx';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Panel from "./Panel.jsx";
import {useNavigate} from "react-router-dom";

export default function SignupModal({ closeModal }) {
  // TODO in the future the API should be setup such that we can tell what error is happening
  const [hasError, setHasError] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: ({ username, email, password }) => apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
      skipAuthRetry: true,
    }),
    onSuccess: async () => {
      // signup sets the auth cookies server-side, so we're logged in already
      await signup();
      setHasError(false);
      closeModal?.();
    },
    onError: (error) => {
      // TODO make this return something more normal
      console.error(error);
      setHasError(true);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    mutate({ username, email, password });
  }

  return (
    <div className="flex-H-V-Center flex-col">
      <Panel>
        <h1 className="font-bold text-4xl mb-5">Sign up</h1>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label htmlFor="username" className="flex flex-col text-xl mb-4">
            Username
            <InputField type="text" name="username" id="username" placeholder="Username" className="border rounded-md p-1 text-lg" />
          </label>

          <label htmlFor="email" className="flex flex-col text-xl mb-4">
            Email
            <InputField type="email" name="email" id="email" placeholder="Email" className="border rounded-md p-1 text-lg" />
          </label>

          <label htmlFor="password" className="flex flex-col text-xl">
            Password
            <InputField type="password" name="password" id="password" placeholder="Password" className="border rounded-md p-1 text-lg" />
          </label>
          {isError && hasError && (
            <p className="text-primary text-xs">Could not sign up. Check your details and try again.</p>
          )}
          <p className="text-primary underline hover:text-secondary" onClick={() => navigate("/login")}>Not new? Click to log in.</p>

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
