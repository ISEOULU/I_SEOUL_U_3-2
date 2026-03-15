import { Notification } from '../../../types';
import { XIcon } from '../icons';

function Toast({
  notif,
  onClose,
}: {
  notif: Notification;
  onClose: () => void;
}) {
  return (
    <div
      className={`p-4 rounded-md shadow-md text-white flex justify-between items-center ${
        notif.type === 'error'
          ? 'bg-red-600'
          : notif.type === 'warning'
            ? 'bg-yellow-600'
            : 'bg-green-600'
      }`}
    >
      <span className="mr-2">{notif.message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        <XIcon strokeWidth={2} className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Toast;
