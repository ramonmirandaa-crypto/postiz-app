export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { SocialAnalyzerComponent } from '@gitroom/frontend/components/social-analyzer/social-analyzer.component';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postiz' : 'Gitroom'} Social Analyzer`,
  description: '',
};

export default async function Index() {
  return <SocialAnalyzerComponent />;
}
