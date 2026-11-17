// src/hooks/useCancelOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cancelOrder } from '../api/orders';
import { toast } from '../lib/toast';

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast('주문이 취소됐어요');
      navigate('/orders');
    },
  });
}

// src/pages/OrderDetailPage.tsx
export function OrderDetailPage({ orderId }: { orderId: string }) {
  const cancelOrderMutation = useCancelOrder();
  return (
    <button type="button" onClick={() => cancelOrderMutation.mutate(orderId)}>
      주문 취소
    </button>
  );
}
