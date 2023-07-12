import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
  credentials: false,
  maxAge: 3600,
};

export default cors(corsOptions);
