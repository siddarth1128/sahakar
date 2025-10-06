import React, { useState } from 'react';
import Input from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { apiPost } from '../lib/api';

const ReferralCode = ({ onCodeGenerated }) => {
  const [referredCode, setReferredCode] = useState('');
  const { user } = useSelector((state) => state.user);
  const mutation = useMutation({
    mutationFn: async (code) => {
      const data = await apiPost('/api/auth/referral-code', { userId: user.id, referredByCode: code });
      return data;
    },
    onSuccess: (data) => {
      if (data.referralCode) {
        onCodeGenerated(data.referralCode);
        toast.success('Referral code generated!');
      } else {
        toast.success('Referral applied! You may earn points.');
      }
    },
    onError: () => toast.error('Failed to process referral code'),
  });

  const handleSubmit = () => {
    if (referredCode.trim()) {
      mutation.mutate(referredCode);
    }
  };

  const generateMyCode = () => {
    mutation.mutate(''); // Empty for generate
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refer a Friend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Enter referral code</label>
          <Input 
            value={referredCode}
            onChange={(e) => setReferredCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <Button onClick={handleSubmit} disabled={mutation.isPending || !referredCode.trim()}>
          Apply Code
        </Button>
        <Button onClick={generateMyCode} variant="outline" className="w-full">
          Generate My Code
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReferralCode;