import {Router} from 'express';
import {Joi, Segments, celebrate} from 'celebrate';
import {WantsRouterArgs} from './interfaces/wants-router-args';
import {StatusCodes} from 'http-status-codes';
import {WantVisibility} from '../../models';
import {UnauthorizedError} from 'express-oauth2-jwt-bearer';

class WantsRouter {
  private readonly checkJwt;
  private readonly wantsService;

  constructor(args: WantsRouterArgs) {
    this.checkJwt = args.checkJwt;
    this.wantsService = args.wantsService;
  }

  get router() {
    const router = Router();

    router.post(
      '/',
      this.checkJwt,
      celebrate({
        [Segments.BODY]: Joi.object()
          .keys({
            title: Joi.string().required(),
            description: Joi.string(),
            visibility: Joi.string()
              .valid(...Object.values(WantVisibility))
              .required(),
            address: Joi.string(),
            radiusInMeters: Joi.number().integer(),
          })
          .required(),
      }),
      async (req, res, next) => {
        try {
          const creatorId = req.auth?.payload.sub;

          if (!creatorId) {
            throw new UnauthorizedError('creatorId not found');
          }

          const want = await this.wantsService.createWant({
            creatorId,
            title: req.body.title,
            description: req.body.description,
            visibility: req.body.visibility,
            address: req.body.address,
            radiusInMeters: req.body.radiusInMeters,
          });

          return res.status(StatusCodes.CREATED).json(want);
        } catch (error) {
          return next(error);
        }
      }
    );

    return router;
  }
}

export {WantsRouter};
