import { canViewContent } from '@/lib/policy';
import { requireCurrentUser } from '@/lib/session';

import React from 'react';

async function Content() {
  await requireCurrentUser(canViewContent);

  return <div>content</div>;
}

export default Content;
