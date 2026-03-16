import Image from "next/image";

const Conversation = () => {
  return (
    <article className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 transition hover:border-gray-300 hover:shadow-sm">
      <div className="flex min-w-0 items-center gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
          <Image
            src="/xz_profile.jpg"
            alt="Xiaoai Zhu"
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">Name</p>
            <span className="rounded-full bg-airbnb/10 px-2 py-0.5 text-xs font-medium text-airbnb">
              Guest
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">
            Thanks again! Looking forward to your stay.
          </p>
        </div>
      </div>

      <div className="ml-4 shrink-0 text-right">
        <p className="text-sm font-medium text-gray-900">2m ago</p>
        <p className="mt-1 text-xs text-gray-400">Unread</p>
      </div>
    </article>
  );
};

export default Conversation;
