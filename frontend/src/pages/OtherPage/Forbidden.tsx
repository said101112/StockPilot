import { Link } from 'react-router';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-red-600">403</h1>
      <h2 className="text-2xl mt-4">Accès refusé</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      <Link to="/" className="mt-6 text-blue-600 hover:underline">Retour au tableau de bord</Link>
    </div>
  );
}
