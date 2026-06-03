export const menuData = {
  categories: [
    {
      id: 'supy',
      name_uz: "Sho'rvalar",
      name_ru: 'Супы',
      icon: '🍜',
      items: [
        { id: 'shchi', name_ru: 'Щи', price: 35000 },
        { id: 'tushenka', name_ru: 'Тушенка', price: 45000 },
        { id: 'guja', name_ru: 'Гужа', price: 35000 },
        { id: 'harcho', name_ru: 'Харчо', price: 35000 },
        { id: 'sup-assorti', name_ru: 'Суп ассорти', price: 35000 },
        { id: 'mastova', name_ru: 'Мастова', price: 35000 },
      ]
    },
    {
      id: 'goryachie-zakuski',
      name_uz: 'Issiq gazaklar',
      name_ru: 'Горячие закуски',
      icon: '🔥',
      items: [
        { id: 'hinkali', name_ru: 'Хинкали с говядиной (порц)', price: 45000 },
        { id: 'dolma', name_ru: 'Долма (порц)', price: 45000 },
        { id: 'shur-kabob', name_ru: 'Шур кабоб (порц)', price: 45000 },
        { id: 'chiken', name_ru: 'Чикен (кг)', price: 90000 },
        { id: 'krylyshki-sanders', name_ru: 'Крылышки Сандерс (кг)', price: 90000 },
        { id: 'myaso-po-tayski', name_ru: 'Мясо по тайский', price: 70000 },
        { id: 'yazyk', name_ru: 'Язык в сливочном соусе', price: 80000 },
        { id: 'mulatka', name_ru: 'Мулатка', price: 30000 },
      ]
    },
    {
      id: 'hleb',
      name_uz: 'Non mahsulotlari',
      name_ru: 'Хлеб',
      icon: '🍞',
      items: [
        { id: 'chap-chak', name_ru: 'Чап-Чак', price: 8000 },
        { id: 'cherny', name_ru: 'Черный', price: 10000 },
        { id: 'hleb-assorti', name_ru: 'Хлеб ассорти', price: 30000 },
      ]
    },
    {
      id: 'holodnye-zakuski',
      name_uz: 'Yaxna gazaklar',
      name_ru: 'Холодные закуски',
      icon: '❄️',
      items: [
        { id: 'yahna', name_ru: 'Яхна', price: 80000 },
        { id: 'marinovannoe-assorti', name_ru: 'Маринованное ассорти', price: 60000 },
        { id: 'fruktovoe-assorti', name_ru: 'Фруктовое ассорти', price: 200000 },
        { id: 'ruletki', name_ru: 'Рулетки из баклажана', price: 30000 },
        { id: 'seld', name_ru: 'Сельд по русски', price: 55000 },
        { id: 'syrnaya-doska', name_ru: 'Сырная доска', price: 120000 },
        { id: 'myasnaya-doska', name_ru: 'Мясная доска 600 (гр)', price: 240000 },
        { id: 'haydari', name_ru: 'Хайдари', price: 40000 },
        { id: 'rybny-assorti', name_ru: 'Рыбный ассорти', price: 270000 },
      ]
    },
    {
      id: 'shashlyki',
      name_uz: 'Kabablar',
      name_ru: 'Шашлыки',
      icon: '🥩',
      items: [
        { id: 'moloty', name_ru: 'Молотый', price: 30000 },
        { id: 'kuskovoy-baranina', name_ru: 'Кусковой из баранины', price: 34000 },
        { id: 'kuskovoy-govyadina', name_ru: 'Кусковой из Говядины', price: 35000 },
        { id: 'kurinny-file', name_ru: 'Куринный филе', price: 26000 },
        { id: 'kurinnye-krylyshki', name_ru: 'Куринные крылышки', price: 26000 },
        { id: 'napoleon', name_ru: 'Наполеон', price: 35000 },
        { id: 'rulet', name_ru: 'Рулет', price: 35000 },
        { id: 'bikin', name_ru: 'Бикин', price: 40000 },
        { id: 'cheburek', name_ru: 'Чебурек', price: 40000 },
        { id: 'dumba', name_ru: 'Думба', price: 26000 },
        { id: 'kolbaski', name_ru: 'Колбаски', price: 20000 },
        { id: 'pomidor', name_ru: 'Помидор на гриле', price: 10000 },
        { id: 'kartofel', name_ru: 'Картофель на гриле', price: 10000 },
        { id: 'pechen', name_ru: 'Печень', price: 26000 },
        { id: 'koreyka', name_ru: 'Корейка', price: 40000 },
      ]
    },
    {
      id: 'burger-pizza',
      name_uz: 'Fast food',
      name_ru: 'Бургер / Пицца',
      icon: '🍔',
      items: [
        { id: 'peperoni', name_ru: 'Пеперони', price: 80000 },
        { id: 'chetyre-syra', name_ru: 'Четыре сыра', price: 70000 },
        { id: 'chikenburger', name_ru: 'Чикенбургер', price: 40000 },
        { id: 'chizburger', name_ru: 'Чизбургер', price: 45000 },
        { id: 'lavash', name_ru: 'Лаваш', price: 55000 },
      ]
    },
    {
      id: 'osnovnye-blyuda',
      name_uz: 'Asosiy taomlar',
      name_ru: 'Основные блюда',
      icon: '🍛',
      items: [
        { id: 'vaguri', name_ru: 'Вагури (кг)', price: 350000 },
        { id: 'umakay-kuy', name_ru: 'Умакай куй гушт (кг)', price: 320000 },
        { id: 'umakay-mol', name_ru: 'Умакай мол гушт (кг)', price: 320000 },
        { id: 'tandyr', name_ru: 'Тандыр (кг)', price: 320000 },
        { id: 'tabaka', name_ru: 'Табака (кг)', price: 100000 },
        { id: 'zhiz-biz-mol', name_ru: 'Жиз биз мол (кг)', price: 320000 },
        { id: 'zhiz-biz-kuy', name_ru: 'Жиз биз куй (кг)', price: 320000 },
        { id: 'zhiz-biz-kurinny', name_ru: 'Жиз биз куринный (кг)', price: 150000 },
        { id: 'kofte-chashma', name_ru: 'Кофте Чашма (порц)', price: 150000 },
        { id: 'steyk-ribay', name_ru: 'Стейк Рибай (300 гр)', price: 200000 },
        { id: 'steyk-kurinny', name_ru: 'Стейк Куринный (300 гр)', price: 150000 },
        { id: 'lyulya-kebab', name_ru: 'Люля кебаб (порц)', price: 50000 },
        { id: 'kazan-kebab', name_ru: 'Казан кебаб (порц)', price: 50000 },
        { id: 'sazan-mangal', name_ru: 'Сазан на мангале (кг)', price: 150000 },
        { id: 'sazan-zharenny', name_ru: 'Сазан жаренный (кг)', price: 150000 },
        { id: 'chuponcha-chashma', name_ru: 'Чупонча Чашма (кг)', price: 320000 },
        { id: 'medalony', name_ru: 'Медальоны с грибами (порц)', price: 120000 },
        { id: 'gusht-say', name_ru: 'Гушт сай (порц)', price: 100000 },
      ]
    },
    {
      id: 'garniry',
      name_uz: 'Garnirlar',
      name_ru: 'Гарниры',
      icon: '🥗',
      items: [
        { id: 'kartoshka-derevenski', name_ru: 'Картошка по деревенски', price: 30000 },
        { id: 'fri', name_ru: 'Фри', price: 30000 },
        { id: 'ris', name_ru: 'Рис', price: 30000 },
        { id: 'pyure', name_ru: 'Пюре с картошкой', price: 30000 },
        { id: 'ovoshchi-gril', name_ru: 'Овощи на гриле', price: 30000 },
      ]
    },
    {
      id: 'sety',
      name_uz: 'Setlar',
      name_ru: 'Сеты',
      icon: '🎯',
      items: [
        { id: 'set-ot-shefa', name_ru: 'Сет от шефа на 6 персон', price: 400000 },
        { id: 'shashlyk-assorti', name_ru: 'Шашлык ассорти 8 персон', price: 550000 },
        { id: 'myasnoy-assorti', name_ru: 'Мясной ассорти на 10 персон', price: 850000 },
        { id: 'baranina-lopatka', name_ru: 'Баранина лопатка на 5 персон', price: 400000 },
      ]
    },
    {
      id: 'salaty',
      name_uz: 'Salatlar',
      name_ru: 'Салаты',
      icon: '🥬',
      items: [
        { id: 'sezar', name_ru: 'Цезарь с Курицей', price: 45000 },
        { id: 'eva', name_ru: 'Ева', price: 45000 },
        { id: 'chashma-garden', name_ru: 'Чашма Гарден', price: 55000 },
        { id: 'muzhskoy-kapriz', name_ru: 'Мужской Каприз', price: 55000 },
        { id: 'hrustyashchiy-baklazhan', name_ru: 'Хрустящий баклажан', price: 55000 },
        { id: 'olivye', name_ru: 'Оливье', price: 40000 },
        { id: 'svezhiy', name_ru: 'Свежий', price: 30000 },
        { id: 'yaponskiy', name_ru: 'Японский салат', price: 50000 },
        { id: 'achchik-chuchuk', name_ru: 'Аччик-Чучук', price: 30000 },
        { id: 'mazhnuntol', name_ru: 'Мажнунтол', price: 50000 },
        { id: 'frantsuzskiy', name_ru: 'Французский', price: 45000 },
        { id: 'smak', name_ru: 'Смак', price: 45000 },
        { id: 'grecheskiy', name_ru: 'Греческий', price: 45000 },
        { id: 'ovoshchnaya-narezka', name_ru: 'Овощная Нарезка', price: 45000 },
        { id: 'vostochny', name_ru: 'Восточный', price: 45000 },
        { id: 'chuponcha', name_ru: 'Чупонча', price: 30000 },
        { id: 'zelen-assorti', name_ru: 'Зелень ассорти', price: 30000 },
      ]
    },
  ]
}

export function getCategoryById(id) {
  return menuData.categories.find(cat => cat.id === id)
}

export function getItemById(categoryId, itemId) {
  const category = getCategoryById(categoryId)
  if (!category) return null
  return category.items.find(item => item.id === itemId)
}