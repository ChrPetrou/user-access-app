import { notFound } from 'next/navigation';

// catches every URL no other route matches, so unknown pages render (private)/not-found.tsx with the sidebar.
// The (private) layout runs first: logged-out visitors are redirected to /login instead.
const CatchAll = () => notFound();

export default CatchAll;
