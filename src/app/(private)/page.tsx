import { requireCurrentUser } from '@/lib/session';

// "/" — the home page every logged-in user lands on after login
const Home = async () => {
  const user = await requireCurrentUser();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-text">Welcome, {user.fullName}</h1>
      <p className="text-muted">Use the menu on the left to get started.</p>
    </div>
  );
};

export default Home;
