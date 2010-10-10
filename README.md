# pm (*post mortem*)

A stack-based programming language resembling the likes of Forth, Factor.

## Requirements

Make sure you have *NodeJS* installed on your system
  
    wget http://github.com/ry/node/tarball/master
    tar xf *node*.tar.gz
    cd *node* && ./configure && make && sudo make install
    

## Usage

To run a file: ``./interpreter.js test/test.pm``
  
To run interactively: ``./interpreter.js``

To run through the web: ``cd web && node server.js`` and navigate to ``localhost:8080``

## Help

Visit the [Wiki](http://github.com/pheuter/pm/wiki)