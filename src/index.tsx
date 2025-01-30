import { createRoot } from 'react-dom/client';

import Report from '@/components/Report';

document.body.insertAdjacentHTML('afterbegin', '<div id="custom-trainerize-export"></div>');

const root = createRoot(document.getElementById('custom-trainerize-export')!);

root.render(<Report />);