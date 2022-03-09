CREATE TABLE `complete` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) NOT NULL,
 `goal_id` int(11) NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4

CREATE TABLE `goals` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) NOT NULL,
 `category` varchar(255) NOT NULL,
 `title` varchar(255) NOT NULL,
 `startDate` date NOT NULL,
 `endDate` date NOT NULL,
 `description` varchar(255) NOT NULL,
 `resources` varchar(255) NOT NULL,
 `reward` varchar(255) NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4

CREATE TABLE `priorities` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `goal_id` int(11) NOT NULL,
 `intervalset` varchar(255) NOT NULL,
 `intervals` varchar(255) NOT NULL,
 `priority` varchar(255) NOT NULL,
 `dueDate` date NOT NULL,
 `checked` varchar(255) NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=992 DEFAULT CHARSET=utf8mb4

CREATE TABLE `user` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `name` varchar(255) NOT NULL,
 `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
 `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
 `created` date NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4