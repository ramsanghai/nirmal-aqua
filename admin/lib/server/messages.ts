export interface Msg {
  title: string;
  body: string;
}

const sid = (id: string) => id.slice(-6).toUpperCase();
const first = (n?: string) => (n || 'there').trim().split(/\s+/)[0];
const inr = (n?: number) => '₹' + Math.round(n ?? 0).toLocaleString('en-IN');

/* eslint-disable @typescript-eslint/no-explicit-any */
export function orderPlaced(id: string, o: any): Msg {
  return {
    title: 'Order received',
    body: `Hi ${first(o.userName)}, thank you for choosing Nirmal Aqua. Your order #${sid(id)} for ${inr(o.total)} has been placed. We will confirm it shortly.`,
  };
}

export function orderStatus(id: string, o: any): Msg {
  const n = sid(id);
  const map: Record<string, Msg> = {
    placed: { title: 'Order placed', body: `Your order #${n} has been placed.` },
    confirmed: {
      title: 'Order confirmed',
      body: `Good news, your order #${n} is confirmed and is being packed.`,
    },
    shipped: { title: 'Order shipped', body: `Your order #${n} is on its way.` },
    delivered: {
      title: 'Order delivered',
      body: `Your order #${n} has been delivered. Thank you for choosing Nirmal Aqua.`,
    },
    cancelled: {
      title: 'Order cancelled',
      body: `Your order #${n} has been cancelled. If you paid online, the refund will follow to your original payment method.`,
    },
  };
  const m = map[o.status] ?? { title: 'Order update', body: `There is an update on your order #${n}.` };
  return { title: m.title, body: `Hi ${first(o.userName)}, ${m.body.charAt(0).toLowerCase()}${m.body.slice(1)}` };
}

export function adminNewOrder(id: string, o: any): Msg {
  return {
    title: 'New order',
    body: `Order #${sid(id)} from ${o.userName || 'a customer'}${o.isBulk ? ' (bulk)' : ''}, total ${inr(o.total)}.`,
  };
}

export function dealerDecision(u: any): Msg {
  if (u.dealerStatus === 'approved') {
    return {
      title: 'Dealer account approved',
      body: `Hi ${first(u.name)}, your Nirmal Aqua dealer account is approved. You can now see wholesale prices and place bulk orders.`,
    };
  }
  if (u.dealerStatus === 'rejected') {
    return {
      title: 'Dealer application update',
      body: `Hi ${first(u.name)}, we could not approve your dealer application right now. Please contact Nirmal Aqua support for details.`,
    };
  }
  return {
    title: 'Dealer application received',
    body: `Hi ${first(u.name)}, your dealer application is under review.`,
  };
}

export function adminNewDealer(u: any): Msg {
  return {
    title: 'New dealer application',
    body: `${u.businessName || u.name || 'A dealer'} is waiting for approval.`,
  };
}

export function serviceBooked(id: string, s: any): Msg {
  return {
    title: 'Service request received',
    body: `Hi ${first(s.userName)}, we have received your ${String(s.type || 'service').toLowerCase()} request #${sid(id)} for ${s.date || 'your chosen date'} (${s.slot || 'slot'}). We will confirm the schedule soon.`,
  };
}

export function adminNewService(id: string, s: any): Msg {
  return {
    title: 'New service request',
    body: `${s.type || 'Service'} #${sid(id)} from ${s.userName || 'a customer'} on ${s.date || '-'} (${s.slot || '-'}).`,
  };
}

export function serviceUpdate(id: string, s: any): Msg {
  const n = sid(id);
  const note = s.adminNote ? ` Note from our team: ${s.adminNote}` : '';
  const map: Record<string, Msg> = {
    requested: { title: 'Service request received', body: `your service request #${n} is received.` },
    scheduled: {
      title: 'Service scheduled',
      body: `your ${String(s.type || 'service').toLowerCase()} visit #${n} is scheduled for ${s.date || 'the chosen date'} (${s.slot || 'slot'}).${note}`,
    },
    completed: {
      title: 'Service completed',
      body: `your service request #${n} is complete. Thank you for choosing Nirmal Aqua.${note}`,
    },
    cancelled: { title: 'Service cancelled', body: `your service request #${n} has been cancelled.${note}` },
  };
  const m = map[s.status] ?? { title: 'Service update', body: `there is an update on your service request #${n}.${note}` };
  return { title: m.title, body: `Hi ${first(s.userName)}, ${m.body}` };
}
