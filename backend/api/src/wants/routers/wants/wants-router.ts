import {Router} from 'express';
import {Joi, Segments, celebrate} from 'celebrate';
import {WantsRouterArgs} from './wants-router-args';
import {StatusCodes} from 'http-status-codes';
import {WantVisibility} from '../../models';

class WantsRouter {
  private readonly wantsService;

  constructor(args: WantsRouterArgs) {
    this.wantsService = args.wantsService;
  }

  get router() {
    const router = Router();

    router.post(
      '/',
      celebrate({
        [Segments.BODY]: Joi.object()
          .keys({
            title: Joi.string().required(),
            description: Joi.string(),
            visibility: Joi.string()
              .valid(...Object.values(WantVisibility))
              .required(),
          })
          .required(),
      }),
      async (req, res, next) => {
        try {
          const want = await this.wantsService.createWant({
            creatorId: 'google-oauth2|117522282924808798071',
            title: req.body.title,
            description: req.body.description,
            visibility: req.body.visibility,
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
