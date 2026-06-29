import Button from './Button.jsx';
import InputField from './InputField.jsx';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

// TODO put this in the config running
const APIURL = process.env.API_URL;

export default function LoginModal() {
  // TODO in the future the API should be setup such that we can tell what error is happening
  const [hasEmailError, setHasEmailError] = useState(false);
  const [hasPasswordError, setHasPasswordError] = useState(false);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async ({ email, password }) => {
      // Configured fetch to perform a POST request
      const res = await fetch(APIURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    onSuccess: (data) => {
      console.log('Login successful:', data);
      setHasEmailError(false);
      setHasPasswordError(false);
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
      <div className="border p-10 rounded-lg shadow-lg">
        <h1 className="font-bold text-4xl mb-5">Login</h1>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label htmlFor="email" className="flex flex-col text-xl mb-4">
            Email
            <InputField type="email" name="email" id="email" placeholder="Email" className="border rounded-md p-1 text-lg" />
            {isError && hasEmailError && (
              <p className="text-red-800 text-xs">Check email is correct and try again.</p>
            )}
          </label>

          <label htmlFor="password" className="flex flex-col text-xl">
            Password
            <InputField type="password" name="password" id="password" placeholder="Password" className="border rounded-md p-1 text-lg" />
            {isError && hasPasswordError && (
              <p className="text-red-800 text-xs">Check password is correct and try again.</p>
            )}
          </label>

          <div className="text-center mt-5">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Sending...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
