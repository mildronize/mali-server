import App from './@libs/app';

// import IndexRoute from './index/index.route';
import UsersRoute from './users/users.route';
import { IndexController } from './index/index.controller';
import { UsersController } from './users/users.controller';
import { getControllerData } from './@libs/router';
import {AuthController} from './@libs/authentication/auth.controller';

console.log(getControllerData(IndexController));
console.log(getControllerData(UsersController));
console.log(getControllerData(AuthController));

const app = new App([
  IndexController,
  UsersController
  // new UsersRoute()
]);

app.listen();