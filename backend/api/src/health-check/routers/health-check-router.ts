import {Router} from 'express';

class HealthCheckRouter {
  get router() {
    const router = Router();

    router.get('/', (req, res, next) => {
      try {
        return res.json({});
      } catch (error) {
        return next(error);
      }
    });

    return router;
  }
}

export {HealthCheckRouter};
