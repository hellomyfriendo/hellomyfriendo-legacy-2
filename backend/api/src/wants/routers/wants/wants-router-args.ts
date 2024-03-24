import express from 'express';
import {WantsService} from '../../services';

interface WantsRouterArgs {
  checkJwt: express.Handler;
  wantsService: WantsService;
}

export {WantsRouterArgs};
