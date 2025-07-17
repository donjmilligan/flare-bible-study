DROP TABLE IF EXISTS example_phpmvc;

CREATE TABLE example_phpmvc (
  group_id SERIAL PRIMARY KEY,
  group_parent INTEGER NOT NULL DEFAULT 0,
  group_name VARCHAR(220)
);

INSERT INTO example_phpmvc (group_id, group_parent, group_name)
VALUES
	(1, 0, 'Bookmarks Menu'),
	(2, 0, 'Web Dev'),
	(3, 0, 'School'),
	(4, 0, 'Work'),
	(8, 0, 'Music'),
	(9, 0, 'News'),
	(10, 2, 'CSS'),
	(11, 2, 'PHP'),
	(12, 2, 'HTML'),
	(13, 2, 'jQuery'),
	(14, 2, 'Graphics'),
	(15, 8, 'Production Tools'),
	(16, 8, 'Samples'),
	(17, 8, 'Forums'),
	(18, 8, 'Labels'),
	(19, 2, 'Tools'),
	(20, 2, 'Tips'),
	(21, 2, 'User Interface'),
	(22, 2, 'Resources'),
	(23, 0, 'Shopping'),
	(24, 0, 'Travel'),
	(25, 2, 'SEO'),
	(26, 24, 'Properties'),
	(27, 2, 'Databases'),
	(28, 2, 'MySQL');
