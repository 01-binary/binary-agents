// src/hooks/useCancelOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelOrder } from '../api/orders';

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// src/pages/OrderDetailPage.tsx
import { useNavigate } from 'react-router-dom';
import { toast } from '../lib/toast';

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  const cancelOrderMutation = useCancelOrder();

  const handleCancelClick = () => {
    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => {
        toast('주문이 취소됐어요');
        navigate('/orders');
      },
    });
  };

  return (
    <button type="button" onClick={handleCancelClick} disabled={cancelOrderMutation.isPending}>
      주문 취소
    </button>
  );
}
