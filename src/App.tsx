import {ToastContainer} from 'react-toastify';
import {LoadFileDialog} from "./components/LoadFileDialog";
import {Optimizers} from './components/optimizer/Optimizers';

import './App.scss';
import 'react-toastify/dist/ReactToastify.css';

const App = () => (
  <div className="App">
    <LoadFileDialog></LoadFileDialog>
    <Optimizers></Optimizers>
    <ToastContainer></ToastContainer>
  </div>
);

export default App;

