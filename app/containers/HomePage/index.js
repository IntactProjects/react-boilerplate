import React, { useEffect } from 'react';
import { compose } from 'redux';

import { useDispatch, useSelector } from 'react-redux';
import { useLifecycleSelector } from '@kai23/reduxutils';
import { injectReducer, injectSaga } from 'redux-injectors';

import actions from './core/actions';
import reducer from './core/reducer';
import saga from './core/saga';

import './assets/styles.scss';

const key = 'home';

function HomePage() {
  const dispatch = useDispatch();
  const getTodos = useLifecycleSelector(key, 'getTodos');
  const todos = useSelector((store) => store[key].todos);

  useEffect(() => {
    dispatch(actions.getTodos());
  }, []);

  return (
    <div className="home">
      <h1>
        Example of todos GET

        {getTodos.loading && (<p>Chargement des todos...</p>)}
        {getTodos.success && (todos.map((todo) => (
          <p>{todo.title}</p>
        )))}
      </h1>
    </div>
  );
}

const withReducer = injectReducer({ key, reducer });
const withSaga = injectSaga({ key, saga });

export default compose(withReducer, withSaga)(HomePage);
