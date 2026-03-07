import instagramIcon from "@/assets/instagram-icon.png";

const STATIC_TILES = [
  "/instagram-tiles/tile-1.png",
  "/instagram-tiles/tile-2.png",
  "/instagram-tiles/tile-3.png",
];

const InstagramFeed = () => {
  return (
    <section className="py-16 px-6">
      <div className="container max-w-3xl mx-auto">
        <a
          href="https://www.instagram.com/littlemindsbigquestions"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity"
        >
          <img src={instagramIcon} alt="Instagram" className="w-7 h-7 rounded-lg" />
          <h2 className="text-xl font-display font-bold text-foreground">
            @littlemindsbigquestions
          </h2>
        </a>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {STATIC_TILES.map((tile, i) => (
            <a
              key={i}
              href="https://www.instagram.com/littlemindsbigquestions"
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square rounded-2xl overflow-hidden hover:scale-[1.03] transition-transform duration-200 shadow-sm hover:shadow-md"
            >
              <img
                src={tile}
                alt="Instagram post"
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 font-display">
          Real questions from real little minds
        </p>
      </div>
    </section>
  );
};

export default InstagramFeed;
