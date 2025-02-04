import { createRoot } from 'react-dom/client';

import Report from '@/components/Report';

import './styles/app.scss';

document.body.insertAdjacentHTML('afterbegin', '<div id="custom-trainerize-export"></div>');
document.body.classList.add('custom-trainerize-export-active');


const root = createRoot(document.getElementById('custom-trainerize-export')!);

root.render(<Report />);