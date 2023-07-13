import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
  credentials: false,
  maxAge: 7200,
};

export default cors(corsOptions);
