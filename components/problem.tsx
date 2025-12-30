import prisma from "@/lib/prisma";

export default async function Problem() {
  const problems = await prisma.problem.findMany();
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen -mt-16 bg-gray-50">
        <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
          Superblog
        </h1>
        <ol className="list-decimal list-inside font-[family-name:var(--font-geist-sans)]">
          {problems.map((problem) => (
            <li key={problem.id} className="mb-2">
              {problem.title}
              <br/>
              {problem.content}
              {}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
