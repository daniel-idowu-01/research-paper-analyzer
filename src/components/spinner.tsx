export default function Spinner() {
  return (
    <div className="container py-10 px-5 sm:px-10 h-screen">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold tracking-tight"></h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}
