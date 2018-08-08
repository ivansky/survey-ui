import React from 'react';

const Layout: React.StatelessComponent = ({ children }) => {
  return (
    <div className={ 'layout' }>
      { children }
    </div>
  );
};

export default Layout;
