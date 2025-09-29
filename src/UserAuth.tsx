import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Navigate } from 'react-router-dom';
import { supabase } from './supabaseclient';
import { useAuth } from './contexts/AuthContext';

function UserAuth() {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <div className='auth-ctn'>
      <div className="container" style={{
      width: '500px',
      padding: '20px',
      backgroundColor: '#FBDB93'
    }}>
      <Auth 
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#1D794C',
                brandAccent: '#1D794C',
                inputText: '#000000',
                anchorTextColor: '#000000',
                messageText: '#000000',
                inputLabelText: '#000000',
                inputBorder: '#000000',
                inputPlaceholder: '#000000'
              },
              fonts: {
                bodyFontFamily: '"Open Sans", sans-serif',
                buttonFontFamily: '"Open Sans", sans-serif',
                inputFontFamily: '"Open Sans", sans-serif',
                labelFontFamily: '"Open Sans", sans-serif',
              },
              fontSizes: {
                baseBodySize: '16px',
                baseButtonSize: '16px',
                baseLabelSize: '16px',
                baseInputSize: '16px'
              }
            },
          },
        }}
        providers={[]}
      />
    </div>
    </div>
  );
}

export default UserAuth;