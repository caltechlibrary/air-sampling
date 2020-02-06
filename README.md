Template for software repositories by the Caltech Library
=====================================================

This is a template README file for software repositories.  This first paragraph of the README should summarize your software in a concise fashion, preferably using no more than one or two sentences.

[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg?style=flat-square)](https://choosealicense.com/licenses/bsd-3-clause)
[![Latest release](https://img.shields.io/github/v/release/caltechlibrary/template.svg?style=flat-square&color=b44e88)](https://github.com/caltechlibrary/template/releases)


Table of contents
-----------------

* [Introduction](#introduction)
* [Installation](#installation)
* [Usage](#usage)
* [Known issues and limitations](#known-issues-and-limitations)
* [Getting help](#getting-help)
* [Contributing](#contributing)
* [License](#license)
* [Authors and history](#authors-and-history)
* [Acknowledgments](#authors-and-acknowledgments)


Introduction
------------

This repository is a GitHub template repostory for creating software project repositories at the Caltech Library.  The [associated wiki page](https://github.com/caltechlibrary/template/wiki/Using-this-template-repo) explains how to use the template repository.

This README file is in Markdown format, and is meant to provide a template for README files as well an illustration of what the README file can be expected to look like.  For a software project, this [Introduction](#introduction) section &ndash; which you are presently reading &ndash; should provide background for the project, a brief explanation of what the project is about, and optionally, pointers to resources that can help orient readers.  Ideally, this section should be short.


Installation
------------

Create an Amazon Dynamo DB table called air-sampling with primary key time
(type number). The default settings are fine. 

Then create an IAM role that allows access to the table. Click Add role, Select
Lambda, Attach AWSLambdaBasicExecutionRole policy, and call the role
air-sampling. Then select the role, click the small add inline policy box in
the upper right hand corner, pick DynamoDB as the service, search for PutItem,
and search for the ARN for the Dynamo DB table you just created. Click review
policy and set AirSamplingWriteAccess as the name.

Then go to Lambda, create a new function called add-air-values, and select the
air-sampling role. Paste the add-air-values.py script into the editor save.
Paste the example.json into the test event and try running your function.



Usage
-----

This [Usage](#usage) section would explain more about how to run the software, what kind of behavior to expect, and so on.

### _Basic operation_

Begin with the simplest possible example of how to use your software.  Provide example command lines and/or screen images, as appropriate, to help readers understand how the software is expected to be used.  Many readers are likely to look for command lines they can copy-paste directly from your explanations, so it's best to keep that in mind as you write examples.

### _Additional options_

Some projects need to communicate additional information to users and can benefit from additional sections in the README file.  It's difficult to give specific instructions &ndash; a lot depends on your software, your intended audience, etc.  Use your judgement and ask for feedback from users or colleagues to help figure out what else is worth explaining.


Known issues and limitations
----------------------------

In this section, summarize any notable issues and/or limitations of your software.  If none are known yet, this section can be omitted (and don't forget to remove the corresponding entry in the [Table of Contents](#table-of-contents) too); alternatively, you can leave this section in and write something along the lines of "none are known at this time".


Getting help
------------

Inform readers of how they can contact you, or at least how they can report problems they may encounter.  This may simply be a request to use the issue tracker on your repository, but many projects have associated chat or mailing lists, and this section is a good place to mention those.


Contributing
------------

This section is optional; if your repository is for a project that accepts open-source contributions, then this section is where you can mention how people can offer contributions, and point them to your guidelines for contributing.  (If you delete this section, don't forget to remove the corresponding entry in the [Table of Contents](#table-of-contents) too.)


License
-------

Software produced by the Caltech Library is Copyright (C) 2019, Caltech.  This software is freely distributed under a BSD/MIT type license.  Please see the [LICENSE](LICENSE) file for more information.


Authors and history
---------------------------

In this section, list the authors and contributors to your software project.  Adding additional notes here about the history of the project can make it more interesting and compelling.  This is also a place where you can acknowledge other contributions to the work and the use of other people's software or tools.


Acknowledgments
---------------

This work was funded by the California Institute of Technology Library.

(If this work was also supported by other organizations, acknowledge them here.  In addition, if your work relies on software libraries, or was inspired by looking at other work, it is appropriate to acknowledge this intellectual debt too.)

<div align="center">
  <br>
  <a href="https://www.caltech.edu">
    <img width="100" height="100" src=".graphics/caltech-round.png">
  </a>
</div>
