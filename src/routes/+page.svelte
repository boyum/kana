<svelte:head>
	<title>Kana</title>
	<meta name="description" content="Lær Hiragana og Katakana med flash cards" />
</svelte:head>

<section>
   <h1>Velg modus</h1>
   <div class="mode-buttons">
	   <a href="/hiragana" class="mode-btn">Hiragana</a>
	   <a href="/katakana" class="mode-btn">Katakana</a>
	   <a href="/custom" class="mode-btn custom">✨ Egendefinerte lister</a>
   </div>
</section>

<style>
	   section {
		   display: flex;
		   flex-direction: column;
		   justify-content: center;
		   align-items: center;
		   min-height: 80vh;
		   padding: 2rem;
	   }
	   
	   h1 {
		   font-size: 4rem;
		   margin-bottom: 3rem;
		   color: var(--color-heading);
	   }
	   
	   .mode-buttons {
		   display: flex;
		   gap: 3rem;
		   flex-wrap: wrap;
		   justify-content: center;
	   }
	   
	   .mode-btn {
		   padding: 2rem 3rem;
		   font-size: 2rem;
		   font-family: var(--font-heading);
		   background: var(--color-accent);
		   color: white;
		   border-radius: 50px;
		   text-decoration: none;
		   transition: all 0.3s ease;
		   box-shadow: 0 8px 20px rgba(57, 92, 107, 0.2);
		   border: 4px solid rgba(255, 255, 255, 0.3);
	   }
	   
	   .mode-btn:hover {
		   background: var(--color-heading);
		   transform: translateY(-5px) scale(1.05);
		   box-shadow: 0 12px 30px rgba(57, 92, 107, 0.3);
	   }
	   
	   @media (max-width: 720px) {
		   h1 {
			   font-size: 3rem;
		   }
		   
		   .mode-btn {
			   padding: 1.5rem 2.5rem;
			   font-size: 1.5rem;
		   }
	   }
</style>
