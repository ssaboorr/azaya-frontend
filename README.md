# Azaya - Document Management System


## 🚀 Live Demo

**Demo URL**: [https://azaya-frontend.vercel.app/login](https://azaya-frontend.vercel.app/login)

**Source Code**: [https://github.com/ssaboorr/azaya-frontend](https://github.com/ssaboorr/azaya-frontend)

### Demo Credentials

- **Uploader**: `john@example.com` | Password: `password123`
- **Signer**: `alice@example.com` | Password: `password123`
- **Signer**: `jane@example.com` | Password: `password123`


## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Make sure your backend API is running on port 8000:
```bash
# Check if backend is running
npm run check:backend
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Note**: The app will automatically redirect to the login page by default.

## API Proxy Configuration

This project uses Next.js rewrites to proxy API calls to the backend server running on `http://localhost:8000`. 

### How it works:
- Frontend requests: `http://localhost:3000/api/auth/login`
- Proxied to backend: `http://localhost:8000/api/auth/login`
- Configured in: `next.config.ts`
``

## Configuration

### Tailwind + MUI Integration

The project is configured to work seamlessly with both Tailwind CSS and Material-UI:

- **Tailwind Config**: Disabled preflight to avoid conflicts with MUI
- **MUI Theme**: Custom theme with proper font integration
- **CSS Variables**: Shared color system between frameworks


## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Material-UI
- **Icons**: Material-UI Icons
- **Build Tool**: Turbopack (Next.js)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material-UI Documentation](https://mui.com/)