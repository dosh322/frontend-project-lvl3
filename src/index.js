import _ from 'lodash';
import 'bootstrap/dist/css/bootstrap.min.css';

const component = () => {
  const element = document.createElement('div');
  element.innerHTML = _.join(['Hello', 'webpack', 'qq'], ' ');

  return element;
};

const container = document.querySelector('.container');

container.append(component());
