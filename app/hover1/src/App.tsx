import './framer/styles.css'

import WireframeFramerComponent from './framer/wireframe'

export default function App() {
  return (
    <div className='flex flex-col items-center gap-3 bg-[rgb(255,_255,_255)]'>
      <WireframeFramerComponent.Responsive/>
    </div>
  );
};