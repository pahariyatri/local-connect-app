export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">Blog Post: {slug}</h1>
            <p>Content coming soon...</p>
        </div>
    );
}
