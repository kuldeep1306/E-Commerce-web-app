import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-app py-24 text-center">
      <h1 className="font-display font-bold text-5xl text-primary-500">404</h1>
      <p className="text-ink-700 mt-2">This page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
    </div>
  );
}
