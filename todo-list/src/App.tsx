import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { Todo } from './components/Todo';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
    font-family: 'Open Sans', sans-serif;
  }
  #root {
    margin: 0 auto;
  }
`;

const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <Todo/>
    </>
  );
};


export default App;

