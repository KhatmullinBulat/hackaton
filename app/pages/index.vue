<script setup lang="js">
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// -- Начало: Логика хедера --

const RESPONSIVE_WIDTH = 1024;

const isHeaderCollapsed = ref(true);
const collapseBtn = ref(null);
const collapseHeaderItems = ref(null);

function toggleHeader() {
  const btnEl = collapseBtn.value;
  const itemsEl = collapseHeaderItems.value;

  if (!btnEl || !itemsEl) return;

  isHeaderCollapsed.value = !isHeaderCollapsed.value;

  if (!isHeaderCollapsed.value) {
    // Меню открыто
    itemsEl.classList.add("opacity-100");
    itemsEl.style.width = "60vw";
    btnEl.classList.remove("bi-list");
    btnEl.classList.add("bi-x", "max-lg:fixed");
    setTimeout(() => window.addEventListener("click", onHeaderClickOutside), 1);
  } else {
    // Меню закрыто
    itemsEl.classList.remove("opacity-100");
    itemsEl.style.width = "0vw";
    btnEl.classList.remove("bi-x", "max-lg:fixed");
    btnEl.classList.add("bi-list");
    window.removeEventListener("click", onHeaderClickOutside);
  }
}

function onHeaderClickOutside(e) {
  if (
    collapseHeaderItems.value &&
    !collapseHeaderItems.value.contains(e.target)
  ) {
    toggleHeader();
  }
}

function responsive() {
  if (window.innerWidth > RESPONSIVE_WIDTH) {
    if (collapseHeaderItems.value) {
      collapseHeaderItems.value.style.width = "";
    }
    isHeaderCollapsed.value = true;
  }
}

// -- Конец: Логика хедера --

// -- Начало: Анимации GSAP --

let ctx;

onMounted(() => {
  isHeaderCollapsed.value = window.innerWidth < RESPONSIVE_WIDTH;
  window.addEventListener("resize", responsive);

  // Регистрация плагина GSAP
  gsap.registerPlugin(ScrollTrigger);

  ctx = gsap.context(() => {
    gsap.set(".reveal-up", {
      opacity: 0,
      y: "100%",
    });

    gsap.to("#dashboard", {
      boxShadow: "0px 15px 25px -5px rgba(170,49,233,0.44021358543417366)",
      duration: 0.3,
      scrollTrigger: {
        trigger: "#hero-section",
        start: "60% 60%",
        end: "80% 80%",
      },
    });

    const sections = gsap.utils.toArray("section");
    sections.forEach((sec) => {
      const revealUpTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: "10% 80%",
          end: "20% 90%",
        },
      });

      revealUpTimeline.to(sec.querySelectorAll(".reveal-up"), {
        opacity: 1,
        duration: 0.8,
        y: "0%",
        stagger: 0.2,
      });
    });
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", responsive);
  window.removeEventListener("click", onHeaderClickOutside);
  if (ctx) {
    ctx.revert();
  }
});
</script>

<template>
  <div class="flex font-mono min-h-[100vh] flex-col bg-[#181B20] text-white">
    <header
      class="lg:justify-around max-w-lg:px-4 max-w-lg:mr-auto absolute top-0 z-20 flex h-[60px] w-full bg-opacity-0 px-[5%] text-white"
    >
      <a class="h-[50px] w-[50px] p-[4px]" href="">
        <img src="/logo.png" alt="logo" class="object h-full w-full" />
      </a>
      <div
        id="collapsed-header-items"
        ref="collapseHeaderItems"
        class="collapsible-header animated-collapse max-lg:shadow-md"
      >
        <div
          class="flex h-full w-max gap-5 text-base text-white max-lg:mt-[30px] max-lg:flex-col max-lg:place-items-end max-lg:gap-5 lg:mx-auto lg:place-items-center"
        >
          <a class="header-links" href=""> О нас </a>
          <a class="header-links" href="#pricing"> Цены </a>
          <a class="header-links" href=""> Функции </a>
          <a class="header-links" href=""> Компания </a>
        </div>
        <div
          class="mx-4 flex place-items-center gap-[20px] text-base max-md:w-full max-md:flex-col max-md:place-content-center"
        >
          <a
            href="/chat"
            aria-label="signup"
            class="rounded-full bg-secondary px-3 py-2 text-white transition-transform duration-[0.3s] hover:translate-x-2"
          >
            <span>Начать</span>
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
      <button
        id="collapse-btn"
        ref="collapseBtn"
        class="bi bi-list absolute right-3 top-3 z-50 text-3xl text-white lg:hidden"
        aria-label="menu"
        @click="toggleHeader"
      ></button>
    </header>

    <section
      id="hero-section"
      class="relative flex min-h-[100vh] hero-section w-full max-w-[100vw] flex-col overflow-hidden max-md:mt-[50px]"
    >
      <div
        class="hero-bg-gradient flex h-full min-h-[100vh] w-full flex-col place-content-center gap-6 p-[5%] max-lg:p-4 max-xl:place-items-center"
      >
        <div class="flex flex-col place-content-center items-center">
          <div
            class="reveal-up text-center gradient-text text-6xl font-semibold uppercase leading-[80px] max-lg:text-4xl max-md:leading-snug"
          >
            <span class="">Разгадайте </span>
            <br />
            <span class=""> тайны вашего сна </span>
          </div>
          <div
            class="reveal-up mt-10 max-w-[450px] p-2 text-center max-lg:max-w-full"
          >
            Сны — это окно в ваше подсознание. Они могут отражать скрытые
            переживания, страхи, надежды и важные жизненные процессы. Наши сны
            часто хранят ключи к лучшему пониманию себя — но как их
            расшифровать?
          </div>

          <div
            class="reveal-up mt-4 flex place-items-center gap-4 overflow-hidden p-2"
          >
            <a
              class="btn transition-transform duration-[0.3s] hover:scale-x-[1.03]"
              href="/chat"
            >
              Начать
            </a>
            <a
              class="btn !bg-white !text-secondary transition-transform duration-[0.3s] hover:scale-x-[1.03]"
              href=""
            >
              <span>Узнать больше</span>
            </a>
          </div>
        </div>

        <div
          id="dashboard-container"
          class="reveal-up flex w-full place-content-center place-items-center"
        >
          <div
            id="dashboard"
            class="flex max-h-[750px] min-h-[450px] w-full min-w-[350px] max-w-[950px] rounded-2xl overflow-hidden shadow-xl shadow-[#443e437c] max-lg:h-fit max-lg:max-h-[320px] max-lg:min-h-[150px] max-lg:w-[320px]"
          >
            <img
              src="/sonic.png"
              alt="dashboard"
              class="h-full w-full object-cover max-lg:object-contain"
            />
          </div>
        </div>
      </div>
    </section>
    <section
      class="relative flex flex-col w-full max-w-[100vw] place-content-center place-items-center overflow-hidden p-8"
    >
      <h2 class="reveal-up text-3xl max-md:text-xl">
        Нам доверяют известные вам бренды
      </h2>

      <div class="reveal-up carousel-container">
        <div
          class="carousel mt-6 flex w-full lg:w-place-content-center gap-5 max-md:gap-2"
        >
          <div class="carousel-img h-[30px] w-[150px]">
            <img
              src="/brand-logos/google.svg"
              alt="Google"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>

          <div class="carousel-img h-[30px] w-[150px]">
            <img
              src="/brand-logos/adobe.svg"
              alt="Google"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>

          <div class="carousel-img h-[30px] w-[150px]">
            <img
              src="/brand-logos/airbnb.svg"
              alt="Google"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>

          <div class="carousel-img h-[30px] w-[150px]">
            <img
              src="/brand-logos/microsoft.svg"
              alt="Google"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>

          <div class="carousel-img h-[30px] w-[150px]">
            <img
              src="/brand-logos/reddit.svg"
              alt="Google"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>

          <div class="carousel-img h-[30px] w-[150px]">
            <img
              src="/brand-logos/stripe.svg"
              alt="Google"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>
        </div>
      </div>
    </section>
    <section
      class="relative flex w-full min-h-[80vh] max-w-[100vw] flex-col place-content-center place-items-center overflow-hidden p-6"
    >
      <div
        class="reveal-up flex min-h-[60vh] place-content-center place-items-center gap-[10%] max-lg:flex-col max-lg:gap-10"
      >
        <div class="flex">
          <div
            class="max-h-[650px] max-w-[850px] overflow-hidden rounded-lg shadow-lg shadow-[rgba(170,49,233,0.44021358543417366)]"
          >
            <img
              src="/sonic.png"
              alt="coding"
              class="h-full w-full object-cover"
            />
          </div>
        </div>
        <div class="mt-6 flex max-w-[450px] flex-col gap-4">
          <h3 class="text-4xl max-md:text-2xl font-medium">
            Поймите, что ваш разум пытается вам сказать
          </h3>

          <div class="mt-4 flex flex-col gap-3">
            <h4 class="text-xl font-medium">
              <i class="bi bi-check-all !text-2xl"></i>
              DreamInsight —
            </h4>
            <span class="text-lg text-gray-300">
              это инновационное AI-приложение, которое помогает анализировать
              ваши сны с точки зрения психологии. Просто расскажите нам, что вам
              приснилось, и получите глубокий и осмысленный анализ, основанный
              на знаниях психологии и нейросетей.
            </span>
          </div>
          <!-- <div class="mt-4 flex flex-col gap-3">
            <h4 class="text-xl font-medium">
              <i class="bi bi-check-all !text-2xl"></i>
              Locally run
            </h4>
            <span class="text-lg text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Reiciendis commodi temporibus at? Aspernatur, a necessitatibus?
            </span>
          </div> -->
        </div>
      </div>
    </section>

    <!-- <section
      class="relative flex w-full min-h-[80vh] max-w-[100vw] flex-col place-content-center place-items-center overflow-hidden p-6"
    >
      <div
        class="reveal-up flex min-h-[60vh] place-content-center place-items-center gap-[10%] max-lg:flex-col max-lg:gap-10"
      >
        <div class="mt-6 flex max-w-[450px] flex-col gap-4">
          <h3 class="text-4xl max-md:text-2xl font-medium">
            Powerful Version control
          </h3>

          <div class="mt-4 flex flex-col gap-3">
            <h4 class="text-xl font-medium">
              <i class="bi bi-check-all !text-2xl"></i>
              Git
            </h4>
            <span class="text-lg text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Reiciendis commodi temporibus at? Aspernatur, a necessitatibus?
            </span>
          </div>
          <div class="mt-4 flex flex-col gap-3">
            <h4 class="text-xl font-medium">
              <i class="bi bi-check-all !text-2xl"></i>
              Github
            </h4>
            <span class="text-lg text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Reiciendis commodi temporibus at? Aspernatur, a necessitatibus?
            </span>
          </div>
        </div>

        <div class="flex">
          <div
            class="max-h-[650px] max-w-[850px] overflow-hidden rounded-lg shadow-lg shadow-[rgba(170,49,233,0.44021358543417366)]"
          >
            <img
              src="/home/git.png"
              alt="coding"
              class="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section> -->

    <section
      class="relative flex w-full max-w-[100vw] min-h-[100vh] flex-col place-content-center place-items-center overflow-hidden p-6"
    >
      <div class="mt-8 flex flex-col place-items-center gap-5">
        <div class="reveal-up mt-5 flex flex-col gap-3 text-center">
          <h3 class="text-xl text-primary">Любим нашими клиентами</h3>
          <h2 class="text-4xl font-semibold">Как это работает</h2>
        </div>
        <div class="mt-6 flex flex-wrap place-content-center gap-2">
          <div
            class="reveal-up flex h-[250px] w-[350px] flex-col gap-2 p-4 text-center"
          >
            <i class="bi bi-boombox-fill text-5xl text-primary"></i>
            <h3 class="text-2xl font-semibold">Расскажите свой сон</h3>
            <div class="text-gray-300">
              Введите текст или запишите голосом, что вы видели во сне — не
              бойтесь пропустить детали. Чем больше информации, тем точнее
              анализ.
            </div>
          </div>
          <div
            class="reveal-up flex h-[250px] w-[350px] flex-col gap-2 p-4 text-center"
          >
            <i class="bi bi-award-fill text-5xl text-primary"></i>
            <h3 class="text-2xl font-semibold">
              AI анализирует символы и эмоции
            </h3>
            <div class="text-gray-300">
              Наш алгоритм обрабатывает ваш рассказ, выделяя ключевые образы,
              эмоции и сюжеты, сравнивая их с психологическими моделями.
            </div>
          </div>
          <div
            class="reveal-up flex h-[250px] w-[350px] flex-col gap-2 p-4 text-center"
          >
            <i class="bi bi-book-fill text-5xl text-primary"></i>
            <h3 class="text-2xl font-semibold">Получите личный отчет</h3>
            <div class="text-gray-300">
              Узнайте, что могло значить ваше сновидение, какие чувства и
              ситуации в реальной жизни могли его вызвать, и как это связано с
              вашим внутренним состоянием.
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="relative flex w-full max-w-[100vw] min-h-screen flex-col place-content-center place-items-center overflow-hidden p-6"
    >
      <div class="mt-8 flex flex-col place-items-center gap-5">
        <div class="reveal-up mt-5 flex flex-col gap-3 text-center">
          <h2 class="text-4xl font-semibold">Почему это работает</h2>
        </div>
        <div class="mt-6 flex flex-wrap place-content-center gap-2">
          <div
            class="reveal-up flex h-[250px] w-[350px] flex-col gap-2 p-4 text-center"
          >
            <i class="bi bi-boombox-fill text-5xl text-primary"></i>
            <h3 class="text-2xl font-semibold">Научный подход</h3>
            <div class="text-gray-300">
              Основано на теориях Юнга, Фрейда и современных психологических
              практиках.
            </div>
          </div>
          <div
            class="reveal-up flex h-[250px] w-[350px] flex-col gap-2 p-4 text-center"
          >
            <i class="bi bi-award-fill text-5xl text-primary"></i>
            <h3 class="text-2xl font-semibold">Искусственный интеллект</h3>
            <div class="text-gray-300">
              Обученная модель распознает сложные паттерны и символы,
              недоступные обычному человеку.
            </div>
          </div>
          <div
            class="reveal-up flex h-[250px] w-[350px] flex-col gap-2 p-4 text-center"
          >
            <i class="bi bi-book-fill text-5xl text-primary"></i>
            <h3 class="text-2xl font-semibold">Конфиденциальность</h3>
            <div class="text-gray-300">
              Все данные защищены и не передаются третьим лицам.
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="mt-5 flex w-full min-h-[100vh] flex-col place-content-center place-items-center p-[2%]"
    >
      <h3 class="text-3xl font-medium text-primary max-md:text-2xl">
        Любим нашими клиентами
      </h3>
      <!-- Testimonials -->
      <div
        class="mt-8 gap-10 space-y-8 max-md:columns-1 lg:columns-2 xl:columns-3"
      >
        <div
          class="reveal-up flex border-[#333a44] bg-[#1d2127] border h-fit w-[350px] break-inside-avoid flex-col rounded-lg p-4 max-lg:w-[320px]"
        >
          <div class="flex place-items-center gap-3">
            <div
              class="h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-solid border-primary"
            >
              <img
                src="/people/woman.png"
                class="h-full w-full object-cover"
                alt="women"
              />
            </div>
            <div class="flex flex-col gap-1">
              <div class="font-semibold">Трич Б.</div>
              <div class="text-gray-400">АМИ, генеральный директор</div>
            </div>
          </div>
          <p class="mt-4 text-gray-300">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae,
            vero.
          </p>
        </div>
        <div
          class="reveal-up flex border-[#333a44] bg-[#1d2127] border h-fit w-[350px] break-inside-avoid flex-col rounded-lg p-4 max-lg:w-[320px]"
        >
          <div class="flex place-items-center gap-3">
            <div
              class="h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-solid border-primary"
            >
              <img
                src="/people/man.png"
                class="h-full w-full object-cover"
                alt="man"
              />
            </div>
            <div class="flex flex-col gap-1">
              <div class="font-semibold">Джон Б.</div>
              <div class="text-gray-400">ABC, технический директор</div>
            </div>
          </div>
          <p class="mt-4 text-gray-300">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore
            deserunt delectus consectetur enim cupiditate ab nemo voluptas
            repellendus qui quas..
          </p>
        </div>
        <div
          class="reveal-up flex border-[#333a44] bg-[#1d2127] border h-fit w-[350px] break-inside-avoid flex-col rounded-lg p-4 max-lg:w-[320px]"
        >
          <div class="flex place-items-center gap-3">
            <div
              class="h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-solid border-primary"
            >
              <img
                src="/people/man2.png"
                class="h-full w-full object-cover"
                alt="man"
              />
            </div>
            <div class="flex flex-col gap-1">
              <div class="font-semibold">Мант</div>
              <div class="text-gray-400">xyz, cto</div>
            </div>
          </div>
          <p class="mt-4 text-gray-300">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem,
            numquam.
          </p>
        </div>
        <div
          class="reveal-up flex border-[#333a44] bg-[#1d2127] border h-fit w-[350px] break-inside-avoid flex-col rounded-lg p-4 max-lg:w-[320px]"
        >
          <div class="flex place-items-center gap-3">
            <div
              class="h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-solid border-primary"
            >
              <img
                src="/people/woman.png"
                class="h-full w-full object-cover"
                alt="man"
              />
            </div>
            <div class="flex flex-col gap-1">
              <div class="font-semibold">Лара</div>
              <div class="text-gray-400">xz, cto</div>
            </div>
          </div>
          <p class="mt-4 text-gray-300">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Soluta,
            saepe illum. Dicta quisquam praesentium quod!
          </p>
        </div>
        <div
          class="reveal-up flex h-fit border-[#333a44] bg-[#1d2127] border w-[350px] break-inside-avoid flex-col rounded-lg p-4 max-lg:w-[320px]"
        >
          <div class="flex place-items-center gap-3">
            <div
              class="h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-solid border-primary"
            >
              <img
                src="/people/man.png"
                class="h-full w-full object-cover"
                alt="man"
              />
            </div>
            <div class="flex flex-col gap-1">
              <div class="font-semibold">Джеймс</div>
              <div class="text-gray-400">технический директор</div>
            </div>
          </div>
          <p class="mt-4 text-gray-300">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga
            accusamus non enim debitis rem neque beatae explicabo corrupti porro
            ullam?
          </p>
        </div>
        <div
          class="reveal-up flex border-[#333a44] bg-[#1d2127] border h-fit w-[350px] break-inside-avoid flex-col rounded-lg p-4 max-lg:w-[320px]"
        >
          <div class="flex place-items-center gap-3">
            <div
              class="h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-solid border-primary"
            >
              <img
                src="/people/man2.png"
                class="h-full w-full object-cover"
                alt="man"
              />
            </div>
            <div class="flex flex-col gap-1">
              <div class="font-semibold">Рон</div>
              <div class="text-gray-400">marketplace, cto</div>
            </div>
          </div>
          <p class="mt-4 text-gray-300">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga
            accusamus non enim debitis rem neque beatae explicabo corrupti porro
            ullam?
          </p>
        </div>
      </div>
    </section>

    <section
      id="pricing"
      class="mt-5 flex w-full flex-col place-items-center p-[2%]"
    >
      <h3 class="text-3xl font-medium text-primary max-md:text-2xl">
        Наши цены
      </h3>
      <!-- pricing -->
      <div
        class="mt-10 flex flex-wrap place-content-center gap-8 max-lg:flex-col"
      >
        <div
          class="reveal-up flex border-[#333a44] bg-[#1d2127] border-[1px] w-[380px] flex-col place-items-center gap-2 rounded-lg p-8 shadow-xl max-lg:w-[320px]"
        >
          <h3 class="">
            <span class="text-5xl font-semibold">900₽</span>
            <span class="text-2xl text-gray-400">/месяц</span>
          </h3>
          <p class="mt-3 text-center text-gray-300">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab,
            explicabo!
          </p>
          <hr />
          <ul
            class="mt-4 flex flex-col gap-2 text-center text-lg text-gray-200"
          >
            <li>Lorem ipsum dolor sit amet.</li>
            <li>Lorem, ipsum.</li>
            <li>Lorem, ipsum dolor.</li>
            <li>Lorem ipsum dolor sit.</li>
          </ul>
          <a
            href="http://"
            class="btn mt-8 !w-full transition-transform duration-[0.3s] hover:scale-x-[1.02]"
          >
            Получить сейчас
          </a>
        </div>
        <div
          class="reveal-up flex bg-[#1d2127] w-[380px] flex-col place-items-center gap-2 rounded-lg border-2 border-primary p-8 shadow-xl max-lg:w-[320px]"
        >
          <h3 class="">
            <span class="text-5xl font-semibold">1900₽</span>
            <span class="text-2xl text-gray-400">/месяц</span>
          </h3>
          <p class="mt-3 text-center text-gray-300">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab,
            explicabo!
          </p>
          <hr />
          <ul
            class="mt-4 flex flex-col gap-2 text-center text-lg text-gray-200"
          >
            <li>Lorem ipsum dolor sit amet.</li>
            <li>Lorem, ipsum.</li>
            <li>Lorem, ipsum dolor.</li>
            <li>Lorem ipsum dolor sit.</li>
          </ul>
          <a
            href="http://"
            class="btn mt-8 !w-full transition-transform duration-[0.3s] hover:scale-x-[1.02]"
          >
            Получить сейчас
          </a>
        </div>
        <div
          class="reveal-up flex border-[#333a44] bg-[#1d2127] w-[380px] flex-col place-items-center gap-2 rounded-lg p-8 shadow-xl max-lg:w-[320px]"
        >
          <h3 class="">
            <span class="text-5xl font-semibold">4900₽</span>
            <span class="text-2xl text-gray-400">/месяц</span>
          </h3>
          <p class="mt-3 text-center text-gray-300">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab,
            explicabo!
          </p>
          <hr />
          <ul
            class="mt-4 flex flex-col gap-2 text-center text-lg text-gray-200"
          >
            <li>Lorem ipsum dolor sit amet.</li>
            <li>Lorem, ipsum.</li>
            <li>Lorem, ipsum dolor.</li>
            <li>Lorem ipsum dolor sit.</li>
          </ul>
          <a
            href="http://"
            class="btn mt-8 !w-full transition-transform duration-[0.3s] hover:scale-x-[1.02]"
          >
            Получить сейчас
          </a>
        </div>
      </div>
    </section>

    <section
      class="mt-5 flex w-full min-h-[80vh] flex-col place-content-center place-items-center p-[2%] max-lg:p-3"
    >
      <h3 class="reveal-up text-center text-4xl font-medium max-md:text-2xl">
        Для кого это приложение?
      </h3>
      <!-- pricing -->
      <div
        class="reveal-up mt-10 flex flex-wrap place-content-center gap-10 max-lg:flex-col"
      >
        <a
          href=""
          class="flex h-[400px] w-[350px] flex-col gap-2 overflow-clip rounded-lg border-[#333a44] bg-[#1d2127] border-[1px] p-4 shadow-xl max-lg:w-[300px]"
        >
          <div class="h-[200px] w-full overflow-hidden rounded-md">
            <img
              src="/home/forest.png"
              alt="article image"
              class="h-full w-full object-cover"
              srcset=""
            />
          </div>
          <p class="mt-2 mb-auto text-gray-400">
            Для тех, кто хочет лучше понимать себя.
          </p>
          <span>
            <span>Узнать больше</span>
            <i class="bi bi-arrow-right"></i>
          </span>
        </a>
        <a
          href=""
          class="flex h-[400px] w-[350px] flex-col gap-2 overflow-clip rounded-lg border-[#333a44] bg-[#1d2127] border-[1px] p-4 shadow-xl max-lg:w-[300px]"
        >
          <div class="h-[200px] w-full overflow-hidden rounded-md">
            <img
              src="/home/mountain.png"
              alt="article image"
              class="h-full w-full object-cover"
              srcset=""
            />
          </div>
          <p class="mt-2 mb-auto text-gray-400">
            Для людей, переживающих стресс, тревогу или важные жизненные
            изменения.
          </p>
          <span>
            <span>Узнать больше</span>
            <i class="bi bi-arrow-right"></i>
          </span>
        </a>
        <a
          href=""
          class="flex h-[400px] w-[350px] flex-col gap-2 overflow-clip rounded-lg border-[#333a44] bg-[#1d2127] border-[1px] p-4 shadow-xl max-lg:w-[300px]"
        >
          <div class="h-[200px] w-full overflow-hidden rounded-md">
            <img
              src="/home/photography.png"
              alt="article image"
              class="h-full w-full object-cover"
              srcset=""
            />
          </div>
          <p class="mt-2 mb-auto text-gray-400">
            Для всех, кто интересуется символикой снов и глубинной психологией.
          </p>
          <span>
            <span>Узнать больше</span>
            <i class="bi bi-arrow-right"></i>
          </span>
        </a>
      </div>
    </section>

    <section
      class="flex w-full flex-col place-content-center place-items-center gap-[10%] p-[5%] px-[10%]"
    >
      <div
        class="flex w-full flex-col place-content-center place-items-center gap-3"
      >
        <h2 class="text-2xl text-primary max-md:text-xl">
          Подписка на специальную рассылку
        </h2>
        <h2 class="text-xl max-md:text-lg">Будьте в курсе событий</h2>

        <div class="flex h-[60px] place-items-center gap-2 overflow-hidden p-2">
          <input
            type="email"
            class="input h-full w-full p-2 outline-none"
            placeholder="почта"
          />
          <a class="btn transition-colors duration-[0.3s]" href="/register">
            Зарегистрироваться
          </a>
        </div>
      </div>
    </section>

    <footer
      class="mt-auto flex w-full place-content-around gap-3 p-[5%] px-[10%] text-white max-md:flex-col"
    >
      <div
        class="flex h-full w-[250px] flex-col place-items-center gap-6 max-md:w-full"
      >
        <img src="/logo.png" alt="logo" srcset="" class="max-w-[120px]" />
        <div>
          Уфа
          <br />
          Российская Федерация
        </div>
        <div class="mt-3 text-lg font-semibold">Подписывайтесь на нас</div>
      </div>

      <div class="flex h-full w-[250px] flex-col gap-4">
        <h2 class="text-3xl max-md:text-xl">Ресурсы</h2>
        <div class="flex flex-col gap-3 max-md:text-sm">
          <a href="" class="footer-link">О нас</a>
          <a href="" class="footer-link">Часто задаваемые вопросы</a>
          <a href="" class="footer-link">Связаться с нами</a>
          <a href="" class="footer-link">Блоги</a>
          <a href="" class="footer-link">Политика конфиденциальности</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

:root {
  --btn-color: #fdfdfd; /* button color*/
  --btn-bg: #4f55c1; /* button bg color*/

  --primary-text-color: #4f55c1;
  --header-link-hover: #6c72e8;
  --input-hover-bd-color: #4f55c1;
}

html {
  scroll-behavior: smooth;
  font-family: "Roboto", sans-serif;
}

header > .collapsible-header {
  display: flex;
  gap: 1rem;
  width: 100%;
  background-color: inherit;
  place-content: center;
  overflow: hidden;
  transition: width 0.3s ease;
}

.animated-collapse {
  transition: width 0.3s ease;
}

.header-gradient {
  background: rgb(206, 174, 212);
  background: linear-gradient(
    83deg,
    #ceaed474 15%,
    #abd4e693 33%,
    #73edc097 79%,
    #8c91e86b 100%
  );
  filter: blur(100px);
}

.header-links {
  display: flex;
  align-items: center;
  min-width: fit-content;
  border-radius: 10px;
  padding: 5px 10px;
  transition: background-color 0.5s, color 0.5s;
}

.header-links:hover {
  color: var(--header-link-hover);
}

.primary-text-color {
  color: var(--primary-text-color);
}

.gradient-text {
  background: rgb(233, 92, 255);
  background: linear-gradient(
    93deg,
    rgba(233, 92, 255, 1) 12%,
    rgba(210, 125, 255, 1) 49%,
    rgba(159, 121, 255, 1) 93%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-section {
  background-image: url("/dots.svg");
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Do not repeat the image */
  background-size: cover;
}

.hero-bg-gradient {
  background: linear-gradient(
    180deg,
    rgba(24, 27, 32, 0.9) 30%,
    rgba(0, 0, 0, 0.258140756302521) 65%
  );
}

.opacity-0 {
  opacity: 0 !important;
}

.opacity-100 {
  opacity: 100 !important;
}

.btn {
  padding: 10px 15px;
  width: max-content;
  border-radius: 24px;
  color: var(--btn-color);
  background-color: var(--btn-bg);
  justify-content: center;
  align-items: center;
  display: flex;
  cursor: pointer;
}

.input {
  padding: 10px;
  background-color: transparent;
  border-radius: 25px;
  min-width: 100px;
  border: 2px solid #818080;
}

.input:active,
.input:focus,
.input:focus-within {
  border: 2px solid var(--input-hover-bd-color);
}

.carousel-container {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  max-width: 800px;
}

.carousel {
  display: inline-block;
  animation: scroll 10s linear infinite;
}

.carousel-img {
  display: inline-block;
  margin: 0 20px;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.footer-link {
  transition: color 0.3s;
}

.footer-link:hover {
  color: #483cf4;
}

/* Стили для мобильного меню */
@media not all and (min-width: 1024px) {
  header .collapsible-header {
    position: fixed;
    right: 0px;
    flex-direction: column;
    opacity: 0;
    height: 100vh;
    min-height: 100vh;
    height: 100dvh;
    width: 0vw;
    justify-content: space-between;
    padding: 5px;
    padding-top: 5%;
    padding-bottom: 5%;
    place-items: end;
    background-color: #181b20;
    color: #ffffff;
    overflow-y: auto;
    box-shadow: 2px 0px 3px #9f9f9f;
  }

  .header-links {
    color: rgb(255, 255, 255);
  }
}
</style>
